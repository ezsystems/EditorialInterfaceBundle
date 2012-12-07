<?php
/**
 * File containing the ContentExtension class.
 *
 * @copyright Copyright (C) 1999-2012 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\EditorialInterfaceBundle\Tests\Twig\Extension;

use PHPUnit_Framework_TestCase;

use EzSystems\EditorialInterfaceBundle\Twig\Extension\ContentExtension;

use eZ\Publish\API\Repository\Values\Content\Field;
use eZ\Publish\Core\Repository\Values\Content\Content;
use eZ\Publish\Core\Repository\Values\Content\ContentInfo;
use eZ\Publish\Core\Repository\Values\Content\VersionInfo;
use eZ\Publish\Core\Repository\Values\ContentType\FieldDefinition;
use eZ\Publish\Core\Repository\Values\ContentType\ContentType;

class ContentExtensionTest extends PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider providerTestMedata
     */
    public function testMetadata( Content $content, $fieldIdentifier, $canEdit, $prefix, $expectedTplParameters )
    {
        $extensionMock = $this->getMock(
            'EzSystems\\EditorialInterfaceBundle\\Twig\\Extension\\ContentExtension',
            array( 'getBlocksByField' ),
            array(
                $this->getContainerMock(),
                $this->getRepositoryMock( $content, $canEdit ),
                $this->getConfigResolverMock(),
                $prefix
            )
        );
        $extensionMock->expects( $this->any() )
            ->method( 'getBlocksByField' )
            ->will( $this->returnValue( array() ) );
        $extensionMock->initRuntime(
            $this->getTwigEnvironmentMock( $expectedTplParameters )
        );
        $extensionMock->renderField( $content, $fieldIdentifier );
    }

    public function providerTestMedata()
    {
        $prefix = 'data-ez-';
        $fieldsInfo = array(
            'eztext' => array(
                'id' => 1,
                'fieldDefIdentifier' => 'name',
                'value' => 'foo',
                'languageCode' => 'fre-FR'
            ),
            'ezstring' => array(
                'id' => 2,
                'fieldDefIdentifier' => 'name2',
                'value' => 'foo2',
                'languageCode' => 'fre-FR'
            ),
        );
        $content = $this->getContent( $fieldsInfo );

        $versionInfo = $content->getVersionInfo();
        $contentInfo = $versionInfo->getContentInfo();
        $contentType = $contentInfo->getContentType();
        $name = $content->getField( 'name' );

        $baseResults = array(
            'parameters' => array(),
            'attr' => array( 'class' => 'eztext-field' ),
            'field' => $name,
            'contentInfo' => $contentInfo,
            'versionInfo' => $versionInfo,
            'fieldSettings' => $contentType->getFieldDefinition( 'name' )->getFieldSettings()
        );
        $tests = array(
            array(
                $content,
                'name',
                false,
                $prefix,
                $baseResults
            )
        );
        $editResults = $baseResults;
        $editResults['attr'] += array(
            $prefix . 'field-id' => $name->id,
            $prefix . 'field-identifier' => $name->fieldDefIdentifier,
            $prefix . 'field-type-identifier' => 'eztext',
            $prefix . 'content-id' => $contentInfo->id,
            $prefix . 'version' => $versionInfo->versionNo,
            $prefix . 'locale-code' => $name->languageCode,
        );
        $tests[] = array(
            $this->getContent( $fieldsInfo ),
            'name',
            true,
            $prefix,
            $editResults
        );
        $tests[] = array(
            $this->getContent( $fieldsInfo ),
            'name',
            false,
            $prefix . $prefix,
            $baseResults
        );

        $editResultsDblPrefix = $baseResults;
        $editResultsDblPrefix['attr'] += array(
            $prefix . $prefix . 'field-id' => $name->id,
            $prefix . $prefix . 'field-identifier' => $name->fieldDefIdentifier,
            $prefix . $prefix . 'field-type-identifier' => 'eztext',
            $prefix . $prefix . 'content-id' => $contentInfo->id,
            $prefix . $prefix . 'version' => $versionInfo->versionNo,
            $prefix . $prefix . 'locale-code' => $name->languageCode,
        );

        $tests[] = array(
            $this->getContent( $fieldsInfo ),
            'name',
            true,
            $prefix . $prefix,
            $editResultsDblPrefix
        );


        return $tests;
    }

    private function getContent( array $fieldsInfo )
    {
        $fields = array();
        $fieldDefinitions = array();
        foreach ( $fieldsInfo as $type => $info )
        {
            $fields[] = new Field( $info );
            $fieldDefinitions[] = new FieldDefinition(
                array(
                    'identifier' => $info['fieldDefIdentifier'],
                    'id' => $info['id'],
                    'fieldTypeIdentifier' => $type,
                )
            );
        }
        $content = new Content(
            array(
                'internalFields' => $fields,
                'versionInfo' => new VersionInfo(
                    array(
                        'versionNo' => 64,
                        'contentInfo' => new ContentInfo(
                            array(
                                'id' => 42,
                                'mainLanguageCode' => 'fre-FR',
                                'contentType' => new ContentType(
                                    array( 'fieldDefinitions' => $fieldDefinitions )
                                )
                            )
                        )
                    )
                )
            )
        );

        return $content;
    }

    private function getTwigTemplateMock( array $expectedTplParameters )
    {
        $mock = $this->getMockBuilder( 'Twig_Template' )
            ->setMethods( array( 'renderBlock' ) )
            ->disableOriginalConstructor()
            ->getMockForAbstractClass();
        $mock->expects( $this->once() )
            ->method( 'renderBlock' )
            ->with(
                $this->anything(),
                $this->equalTo( $expectedTplParameters ),
                $this->anything()
            );
        return $mock;
    }

    private function getTwigEnvironmentMock( array $expectedTplParameters )
    {
        $mock = $this->getMock( 'Twig_Environment' );
        $mock->expects( $this->once() )
            ->method( 'loadTemplate' )
            ->will(
                $this->returnValue(
                    $this->getTwigTemplateMock( $expectedTplParameters )
                )
            );
        return $mock;
    }

    private function getConfigResolverMock()
    {
        $mock = $this->getMock(
            'eZ\\Publish\\Core\\MVC\\ConfigResolverInterface'
        );
        $mock->expects( $this->once() )
            ->method( 'getParameter' )
            ->will( $this->returnValue( array() ) );
        return $mock;
    }

    private function getRepositoryMock( Content $content, $canEdit )
    {
        $mock = $this->getMock(
            'eZ\\Publish\\API\\Repository\\Repository'
        );
        $mock->expects( $this->once() )
            ->method( 'canUser' )
            ->with(
                $this->equalTo( 'content' ),
                $this->equalTo( 'edit' ),
                $this->equalTo( $content )
            )
            ->will( $this->returnValue( $canEdit ) );
        return $mock;
    }

    private function getContainerMock()
    {
        $mock = $this->getMock(
            'Symfony\\Component\\DependencyInjection\\ContainerInterface'
        );

        return $mock;
    }

}
