import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.ed209),
    AwesomeShader(SA.electron, upSideDown: false),
    // Elemental Ring
    AwesomeShader(SA.elementalRing),
    // TODO: Fix: Effect not match
    // Builder(
    //   builder: (context) {
    //     final main = 'shaders/e/Elevated.frag'.shaderBuffer;
    //     final bufferA = 'shaders/e/Elevated BufferA.frag'.shaderBuffer;
    //     bufferA.feed(
    //       SA.textureGreyNoiseMedium,
    //       wrap: .repeat,
    //       filter: .linear,
    //     );
    //     main.feedShader(bufferA);
    //     return AwesomeShader(
    //       [bufferA, main],
    //     );
    //   },
    // ),
    // Endless living creature
    AwesomeShader(SA.endlessLivingCreature),
    AwesomeShader(
      SA.entryLevel
          .feed(
            SA.textureAbstract1,
            wrap: .repeat,
          )
          .feed(SA.cubemapUffiziGalleryBlurred),
    ),
    // Ether
    AwesomeShader(SA.ether),
    AwesomeShader(SA.eveArrives.feed(SA.textureOrganic2)),
    // Even faster procedural ocean
    if (!kIsWeb) AwesomeShader(SA.evenFasterProceduralOcean),

    // for compare different noise inputs
    // ShaderSurface.builder(
    //   () {
    //     final bufferA = 'shaders/e/expansive reaction-diffusion BufferA.frag'.shaderBuffer;
    //     final bufferB = 'shaders/e/expansive reaction-diffusion BufferB.frag'.shaderBuffer;
    //     final bufferC = 'shaders/e/expansive reaction-diffusion BufferC.frag'.shaderBuffer;
    //     final bufferD = 'shaders/e/expansive reaction-diffusion BufferD.frag'.shaderBuffer;
    //     final mainBuffer = 'shaders/e/expansive reaction-diffusion.frag'.shaderBuffer;

    //     bufferA.feedback(filter: .linear).feed(bufferC, filter: .linear).feed(bufferD, filter: .linear);
    //     bufferA.feed(SA.textureRgbaNoiseMedium, wrap: .repeat, filter: .linear);

    //     bufferB.feed(bufferA, filter: .linear);
    //     bufferC.feed(bufferB, filter: .linear);

    //     // Scheme B: keep Dart feed order; shader remaps channel slots.
    //     mainBuffer.feed(bufferA, filter: .linear);
    //     mainBuffer.feed(bufferC, filter: .linear);
    //     mainBuffer.feed(SA.textureRgbaNoiseMedium, wrap: .repeat, filter: .linear);
    //     return [bufferA, bufferB, bufferC, bufferD, mainBuffer];
    //   },
    // ),
    ShaderSurface.builder(
      () {
        final bufferA = SA.expansiveReactionDiffusionBufferA.shaderBuffer;
        final bufferB = SA.expansiveReactionDiffusionBufferB.shaderBuffer;
        final bufferC = SA.expansiveReactionDiffusionBufferC.shaderBuffer;
        final bufferD = SA.expansiveReactionDiffusionBufferD.shaderBuffer;
        final mainBuffer = SA.expansiveReactionDiffusion.shaderBuffer;

        bufferA.feedback(filter: .linear).feed(bufferC, filter: .linear).feed(bufferD, filter: .linear);
        bufferA.feed(rgbaNoiseMediumInput, wrap: .repeat, filter: .linear);

        bufferB.feed(bufferA, filter: .linear);
        bufferC.feed(bufferB, filter: .linear);

        // Scheme B: keep Dart feed order; shader remaps channel slots.
        mainBuffer.feed(bufferA, filter: .linear);
        mainBuffer.feed(bufferC, filter: .linear);
        mainBuffer.feed(rgbaNoiseMediumInput, wrap: .repeat, filter: .linear);
        return [bufferA, bufferB, bufferC, bufferD, mainBuffer];
      },
    ),
  ];
}
